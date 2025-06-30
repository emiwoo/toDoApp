import styles from './modules/RegisterPage.module.css';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    async function registerUserAndPass() {
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        if (/^\s*$/.test(username) || /^\s*$/.test(password)) {
            console.log('either username or password is invalid');
            return;
        }

        const userAndPass = {
            username: username,
            password: password
        };

        await fetch('https://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'appliction/json' },
            body: JSON.stringify(userAndPass)
        });
        navigate('/');
    }

    return (
        <form className={styles.holder}>
            <label>Register</label>
            <input placeholder='Username' ref={usernameRef} />
            <input placeholder='Password' ref={passwordRef} />
            <button onClick={(event) => {
                event.preventDefault();
                registerUserAndPass();
            }}>Register</button>
            <p onClick={() => navigate('/login')}>Log in here</p>
        </form>
    );
}

export default RegisterPage;