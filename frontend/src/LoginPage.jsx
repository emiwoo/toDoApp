import styles from './modules/LoginPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

function LoginPage() {
    const navigate = useNavigate();
    const usernameRef = useRef();
    const passwordRef = useRef();

    async function login() {
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        if (/^\s*$/.test(username) || /^\s*$/.test(password)) {
            console.log('invalid username or password');
            return;
        }

        const userAndPass = {
            username: username,
            password: password
        };

        const valid = await fetch('http://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userAndPass)
        });
        const text = await valid.text();
        if (text === 'yes') {
            navigate('/');
            return;
        }
        console.log('invalid login');
    }

    return (
        <section className={styles.holder}>
            <label>Log in</label>
            <input placeholder='Username' ref={usernameRef} />
            <input placeholder='Password' ref={passwordRef} />
            <button onClick={login}>Log in</button>
            <p onClick={() => navigate('/register')}>Register here</p>
        </section>
    );
}

export default LoginPage;