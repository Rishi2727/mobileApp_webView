/**
 * Navigation helper for use outside React components (e.g., in Zustand stores)
 * This allows us to use React Router navigation from stores instead of window.location
 */

type NavigateFunction = (to: string, options?: { replace?: boolean }) => void;

let navigateRef: NavigateFunction | null = null;

/**
 * Set the navigate function reference from a React component
 * Should be called once when the app initializes
 */
export const setNavigateRef = (navigate: NavigateFunction) => {
    navigateRef = navigate;
};

/**
 * Navigate programmatically from outside React components
 * @param to - The path to navigate to
 * @param options - Navigation options (e.g., replace)
 */
export const navigate = (to: string, options?: { replace?: boolean }) => {
    if (navigateRef) {
        navigateRef(to, options);
    } else {
        // Fallback to window.location if navigate ref is not set
        console.warn('Navigate ref not set, falling back to window.location');
        if (options?.replace) {
            window.location.replace(to);
        } else {
            window.location.href = to;
        }
    }
};
