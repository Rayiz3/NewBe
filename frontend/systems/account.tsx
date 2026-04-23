import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createClient } from '@supabase/supabase-js';
import { create } from "zustand";
import { usePersonaStore } from "./persona";

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
    const idToken = result.data?.idToken;

    if (!idToken) {
        throw new Error("Google idToken is not given.");
    }

    // Supabase id authorization
    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken
    })
    if (!data.user) {
        throw new Error(`Authenciation failed: ${error?.message}`);
    }

    // get authorized user
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    if (!authUserData.user) {
        throw new Error("Authenticated user is not available.");
    }
    const authUser = authUserData.user;

    // add user to public.users table
    const { data: upsertData, error: upsertError } = await supabase.from("users").upsert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name,
    }).select();
    setUserId(authUser.id);
    setFeed((upsertData?.[0]?.feed ?? []) as string[]);

    if (upsertError) {
        throw new Error(`Upsertion failed: ${error?.message}`);
    }

    return { idToken, profile: result.data?.user }
}

interface AccountProps {
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
    isLogin: false,
    setIsLogin: (v) => set({ isLogin: v }),

    isLoading: false,
    setIsLoading: (v) => set({ isLoading: v }),

    userId: null,
    setUserId: (v) => set({ userId: v}),

    userName: "",
    setUserName: (v) => set({ userName: v}),
}));