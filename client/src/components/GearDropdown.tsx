import { useState, useRef, useCallback } from 'react'
import '../css/App.css'

interface GearDropdownProps {
    children: React.ReactNode;
    title?: string;
    containerStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
    menuStyle?: React.CSSProperties;
    iconSize?: number;
}

export default function GearDropdown({
    children,
    title = 'Options',
    containerStyle,
    buttonStyle,
    menuStyle,
    iconSize = 24
}: GearDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleDropdownEnter = useCallback(() => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current)
            dropdownTimeoutRef.current = null
        }
    }, [])

    const handleDropdownLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setShowDropdown(false)
        }, 300)
    }, [])

    const toggleDropdown = useCallback(() => {
        if (showDropdown) {
            setShowDropdown(false)
        } else {
            setShowDropdown(true)
            handleDropdownEnter()
        }
    }, [showDropdown, handleDropdownEnter])

    return (
        <div 
            className="admin-dropdown-container" 
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
            style={containerStyle}
        >
            <button
                type="button"
                className="btn-outline admin-gear-btn"
                onClick={toggleDropdown}
                title={title}
                style={buttonStyle}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <div className={`admin-dropdown-spacer ${showDropdown ? 'open' : ''}`}>
                <div className="admin-dropdown-menu" style={menuStyle} onClick={() => setShowDropdown(false)}>
                    {children}
                </div>
            </div>
        </div>
    )
}
