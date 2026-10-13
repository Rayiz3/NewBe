import { GOOGLE_WEB_CLIENT_ID } from "@/constants/data";
import { Alert } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createClient } from '@supabase/supabase-js';
import { create } from "zustand";
import { usePersonaStore } from "./persona";

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: true });

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

export async function updateFeed() {
    const feed = usePersonaStore.getState().feed;
    const userId = useAccountStore.getState().userId;

    const { data, error } = await supabase.from("users").update({
        feed: feed,
    }).eq("id", userId);

    if (error) {
        throw new Error(`Feed update failed: ${error?.message}`);
    }
}

export async function signInWithGoogle() {
    const setUserId = useAccountStore.getState().setUserId;
    const setFeed = usePersonaStore.getState().setFeed;

    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    if (result.type === 'cancelled') return null;
    const idToken = result.data?.idToken;

    if (!idToken) {
        throw new Error("Google idToken is not given.");
    }

    // Supabase id authorization
    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken
    })
    if (error || !data.user) {
        throw new Error(`구글 계정 인증 실패: ${error?.message ?? '사용자 정보가 없습니다.'}`);
    }

    // get authorized user
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    if (authUserError || !authUserData.user) {
        throw new Error(`사용자 인증 확인 실패: ${authUserError?.message ?? '사용자 정보가 없습니다.'}`);
    }
    const authUser = authUserData.user;

    // add user to public.users table
    const { data: upsertData, error: upsertError } = await supabase.from("users").upsert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name,
    }).select();
    if (upsertError) {
        throw new Error(`사용자 정보 저장 실패: ${upsertError.message}`);
    }
    setUserId(authUser.id);
    setFeed((upsertData?.[0]?.feed ?? []) as string[]);

    return { idToken, profile: result.data?.user }
}

interface AccountProps {
    login: () => Promise<void>;
    isLogin: boolean
    setIsLogin: (v: boolean) => void

    isLoading: boolean
    setIsLoading: (v: boolean) => void

    userId: string | null
    setUserId: (v: string | null) => void

    userName: string
    setUserName: (v: string) => void
}

export const useAccountStore = create<AccountProps>((set, get) => ({
    login: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
            const result = await signInWithGoogle();
            if (result) set({ userName: result.profile?.name ?? '사용자', isLogin: true });
        } catch (error) {
            Alert.alert('로그인 실패', error instanceof Error ? error.message : '로그인하지 못했습니다. 다시 시도해 주세요.');
        } finally {
            set({ isLoading: false });
        }
    },
    isLogin: false,
    setIsLogin: (v) => set({ isLogin: v }),

    isLoading: false,
    setIsLoading: (v) => set({ isLoading: v }),

    userId: null,
    setUserId: (v) => set({ userId: v}),

    userName: "",
    setUserName: (v) => set({ userName: v}),
}));

export async function saveCurrentFeed() {
    const { userId, isLogin } = useAccountStore.getState();
    if (!userId || !isLogin) return;
    try {
        await updateFeed();
    } catch (error) {
        Alert.alert('피드 저장 실패', error instanceof Error ? error.message : '피드를 저장하지 못했습니다.');
    }
}

export async function getAccountAccessToken() {
    if (!useAccountStore.getState().isLogin) throw new Error('로그인 후 스크랩할 수 있어요.');
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new Error('다시 로그인해주세요.');
    return data.session.access_token;
}
