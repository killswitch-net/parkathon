import { useState } from "react";
import user_icon from "./assets/user.png";
import password_icon from "./assets/password.png";
import email_icon from "./assets/email.png";
import { login, signup } from "./api/user";
import { X } from "lucide-react";

function SignupLogin({ setShowSignupLogin, setUserId, setMessage }) {
    const [action, setAction] = useState("Login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (action === "Login") {
                const data = await login(form.email, form.password).catch(() => {
                    setMessage("Invalid email or password");
                });
                setUserId(data.userId);
            } else if (action === "Sign Up") {
                const data = await signup(form.name, form.email, form.password).catch(() => {
                    setMessage("Error trying to sign up");
                });
                setUserId(data.userId);
            }
            setShowSignupLogin(false);
        } catch (error) {
            setMessage("Error trying to login or sign up");
            console.error("Form error:", error);
        }
    };

    return (
        <div className="relative mx-4 flex w-full max-w-[600px] flex-col rounded-2xl border-3 bg-white px-4 pb-8 sm:mx-auto sm:px-6">
            <button className="absolute top-4 right-4 border-slate-600 rounded-full border-2 p-2 transition-colors hover:cursor-pointer hover:bg-slate-100">
                <X
                    size={32}
                    color="#2e2e2e"
                    onClick={() => setShowSignupLogin(false)}
                />
            </button>
            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-8">
                <div className="text-3xl font-bold text-black sm:text-5xl">
                    {action}
                </div>
                <div className="h-1 sm:w-45 rounded-lg bg-black w-32"></div>
            </div>
            <form
                className="mt-8 flex flex-col gap-4 sm:mt-14 sm:gap-6"
                onSubmit={handleSubmit}
            >
                {action === "Login" ? (
                    <div></div>
                ) : (
                    <div className="mx-auto flex h-16 w-full max-w-[480px] items-center rounded-md bg-[#eaeaea] sm:h-20">
                        <img
                            src={user_icon}
                            alt=""
                            className="mx-4 h-6 w-6 sm:mx-8 sm:h-8 sm:w-8"
                        />
                        <input
                            type="text"
                            placeholder="Name"
                            className="h-[40px] w-full border-none bg-transparent text-base text-gray-600 outline-none sm:h-[50px] sm:text-lg"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </div>
                )}
                <div className="mx-auto flex h-16 w-full max-w-[480px] items-center rounded-md bg-[#eaeaea] sm:h-20">
                    <img
                        src={email_icon}
                        alt=""
                        className="mx-4 h-6 w-6 sm:mx-8 sm:h-8 sm:w-8"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="h-[40px] w-full border-none bg-transparent text-base text-gray-600 outline-none sm:h-[50px] sm:text-lg"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>
                <div className="mx-auto flex h-16 w-full max-w-[480px] items-center rounded-md bg-[#eaeaea] sm:h-20">
                    <img
                        src={password_icon}
                        alt=""
                        className="mx-4 h-6 w-6 sm:mx-8 sm:h-8 sm:w-8"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="h-[40px] w-full border-none bg-transparent text-base text-gray-600 outline-none sm:h-[50px] sm:text-lg"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                </div>
                <div className="mx-auto mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:gap-8">
                    <button
                        type="button"
                        className={`flex h-[50px] w-32 cursor-pointer items-center justify-center rounded-full text-base font-bold sm:h-[59px] sm:w-[220px] sm:text-lg ${
                            action === "Login"
                                ? "bg-[#eaeaea] text-[#676767]"
                                : "bg-black text-white"
                        }`}
                        onClick={(e) => {
                            if (action === "Sign Up") handleSubmit(e);
                            setAction("Sign Up");
                        }}
                    >
                        Sign Up
                    </button>
                    <button
                        type="button"
                        className={`flex h-[50px] w-full cursor-pointer items-center justify-center rounded-full text-base font-bold sm:h-[59px] sm:w-[220px] sm:text-lg ${
                            action === "Sign Up"
                                ? "bg-[#eaeaea] text-[#676767]"
                                : "bg-black text-white"
                        }`}
                        onClick={(e) => {
                            if (action === "Login") handleSubmit(e);
                            setAction("Login");
                        }}
                    >
                        Log In
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SignupLogin;
