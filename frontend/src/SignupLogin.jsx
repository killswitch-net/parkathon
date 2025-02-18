import React, { useState } from 'react';
import './SignupLogin.css';

import user_icon from './assets/user.png';
import password_icon from './assets/password.png';
import email_icon from './assets/email.png';

import { login, signup } from './api/user';

function SignupLogin({ setShowSignupLogin }) {
    const [action, setAction] = useState("Login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (action === "Login") {
                await login(form.email, form.password);
            } else if (action === "Sign Up") {
                await signup(form.name, form.email, form.password);
            }
            setShowSignupLogin(false);
        } catch (error) {
            alert(`${action} failed!`);
        }
    };

    return (
        <div className='container'>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>
            <form className="inputs" onSubmit={handleSubmit}>
                {action === "Login" ? <div></div> : <div className="input">
                    <img src={user_icon} alt="" />
                    <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>}
                <div className="input">
                    <img src={email_icon} alt="" />
                    <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="input">
                    <img src={password_icon} alt="" />
                    <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="options-container">
                    <div className={action === "Login" ? "options gray" : "options"} onClick={(e) => {
                        if (action === "Sign Up") handleSubmit(e);
                        setAction("Sign Up");
                    }}>Sign Up</div>
                    <div className={action === "Sign Up" ? "options gray" : "options"} onClick={(e) => {
                        if (action === "Login") handleSubmit(e);
                        setAction("Login");
                    }}>Log In</div>
                </div>
            </form>
        </div>
    );
}

export default SignupLogin;