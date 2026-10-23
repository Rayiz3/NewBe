import { GOOGLE_WEB_CLIENT_ID, LINK_SERVER } from "@/constants/data";
import { Alert, AppState, Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createClient, processLock, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { usePersonaStore } from "./persona";

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: true });

// Match Supabase's default key so existing installations keep their sessions.
const authStorageKey = `sb-${process.env.EXPO_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
const deletedAccounts = new Set<string>();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: {
        storageKey: authStorageKey,
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: processLock,
    } }
)

export async function updateFeed() {
    const feed = usePersonaStore.getState().feed;
    const userId = useAccountStore.getState().userId;

    const { error } = await supabase.from("users").update({
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
    deleteAccount: () => Promise<void>;
    logout: () => Promise<void>;
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
    deleteAccount: async () => {
        if (get().isLoading || !get().isLogin) return;
        set({ isLoading: true });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        let deletedOnServer = false;
        try {
            const token = await getAccountAccessToken();
            const response = await fetch(`${LINK_SERVER}/account`, {
                method: 'DELETE', signal: controller.signal,
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(response.status === 401
                ? '인증이 만료됐어요. 다시 로그인한 뒤 시도해 주세요.'
                : '계정을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
            deletedOnServer = true;
            // Ignore late auth callbacks for this deleted identity.
            const deletedId = get().userId;
            if (deletedId) deletedAccounts.add(deletedId);
            applySession(null);
            try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* Clear storage below even offline. */ }
            for (const key of [authStorageKey, `${authStorageKey}-code-verifier`, `${authStorageKey}-user`]) {
                if (Platform.OS === 'web') globalThis.localStorage?.removeItem(key);
                else await AsyncStorage.removeItem(key);
            }
            try { await GoogleSignin.signOut(); } catch { /* Provider cleanup is best effort. */ }
            Alert.alert('계정 삭제 완료', '뉴비 계정과 프로필, 맞춤 피드, 스크랩을 삭제했어요.');
        } catch (error) {
            Alert.alert('계정 삭제 확인', deletedOnServer
                ? '서버에서 계정을 삭제했지만 기기의 로그인 정보 정리를 완료하지 못했어요. 앱의 저장공간을 지워 주세요.'
                : error instanceof Error && error.name !== 'AbortError'
                ? error.message : '서버 응답을 확인하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.');
        } finally { clearTimeout(timeout); set({ isLoading: false }); }
    },
    logout: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error) throw error;
            applySession(null);
            // Supabase sign-out is authoritative; provider cleanup is best effort.
            try { await GoogleSignin.signOut(); } catch { /* Already signed out locally. */ }
        } catch {
            Alert.alert('로그아웃 실패', '로그아웃하지 못했습니다. 다시 시도해 주세요.');
        } finally { set({ isLoading: false }); }
    },
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


const defaultFeed = [...usePersonaStore.getState().feed];
let sessionVersion = 0;
function applySession(session: Session | null) {
    if (session?.user && deletedAccounts.has(session.user.id)) return;
    const user = session?.user;
    const previous = useAccountStore.getState();
    if (!user) {
        sessionVersion++;
        useAccountStore.setState({ isLogin: false, userId: null, userName: '' });
        usePersonaStore.getState().setFeed([...defaultFeed]);
        return;
    }
    const changed = previous.userId !== user.id || !previous.isLogin;
    useAccountStore.setState({ isLogin: true, userId: user.id,
        userName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '사용자' });
    if (!changed) return; // Token refresh must not overwrite an edited feed.
    const version = ++sessionVersion;
    usePersonaStore.getState().setFeed([...defaultFeed]);
    // Auth callbacks must return before calling another Supabase API (auth lock).
    setTimeout(() => { void restoreProfile(user.id, version); }, 0);
}

async function restoreProfile(userId: string, version: number) {
    const initialFeed = usePersonaStore.getState().feed;
    try {
        const { data, error } = await supabase.from('users').select('feed').eq('id', userId).maybeSingle();
        if (!error && Array.isArray(data?.feed) && version === sessionVersion &&
            useAccountStore.getState().userId === userId && usePersonaStore.getState().feed === initialFeed) {
            usePersonaStore.getState().setFeed(data.feed.filter((id: unknown): id is string => typeof id === 'string'));
        }
    } catch { /* Keep the session when a profile fetch fails or the device is offline. */ }
}

// Mounted once by the root layout; clean up listeners for Fast Refresh/remounts.
export function initializeAccountSession() {
    let disposed = false;
    let receivedEvent = false;
    useAccountStore.setState({ isLoading: true });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (disposed) return;
        receivedEvent = true;
        applySession(session);
        if (_event === 'INITIAL_SESSION') useAccountStore.setState({ isLoading: false });
    });
    void supabase.auth.getSession().then(({ data, error }) => {
        if (!disposed && !receivedEvent && !error) applySession(data.session);
    }).catch(() => {
        // A temporary network error must not erase persisted credentials.
    }).finally(() => {
        if (!disposed) useAccountStore.setState({ isLoading: false });
    });
    const updateRefresh = (state: string) => {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
    };
    if (Platform.OS !== 'web') updateRefresh(AppState.currentState);
    const listener = Platform.OS !== 'web' ? AppState.addEventListener('change', updateRefresh) : null;
    return () => {
        disposed = true;
        sessionVersion++;
        subscription.unsubscribe();
        listener?.remove();
        if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
}
