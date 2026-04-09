import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    
    theme: {
        extend: {
            colors: {
                "primary": "#003f87",
                "surface": "#f8fafb",
                "on-surface": "#191c1d",
                // 필요한 커스텀 컬러들을 여기에 추가하세요
            },
        },
    },
    plugins: [],
} satisfies Config