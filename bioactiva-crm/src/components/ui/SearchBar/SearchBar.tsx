'use client'

import { useEffect } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/shared/useDebounce'

interface SearchBarProps {
    placeholder: string
    value: string
    onChange: (value: string) => void
    debounceDelay?: number
}

export function SearchBar({
    placeholder,
    value,
    onChange,
    debounceDelay = 0,
}: Readonly<SearchBarProps>) {
    const debouncedValue = useDebounce(value, debounceDelay)

    useEffect(() => {
        onChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue])

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 border-[#BCF7B3] bg-[#F1FFEC] focus:border-[#1C7E3C] focus:outline-none transition-colors"
            />
        </div>
    )
}