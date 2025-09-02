import React from 'react'
import logo from '../assets/img/logo.png'

function Navbar() {
    return (
        <div>
            <nav>
                <div className="logo">
                    <img src={logo} alt="PSU Logo" />
                </div>
                <div className="search"></div>
                <div className="menu"></div>
            </nav>
        </div>
    )
}

export default Navbar;