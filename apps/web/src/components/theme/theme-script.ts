export const THEME_STORAGE_KEY = "levelup-theme";

/**
 * Runs before first paint (see app/layout.tsx) so the correct theme is applied
 * without a flash. Keep it tiny, dependency-free and ES5-safe.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
