import styles from './modules/toDoApp.module.css';
import EnterTaskForm from './EnterTaskForm.jsx';
import TaskContainer from './TaskContainer.jsx';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
    const [loading, setLoading] = useState(true);
    const [dark, setDark] = useState(false);
    const [task, setTask] = useState('');
    const navigate = useNavigate();

    async function verifyaccess() {
        const response = await fetch('http://localhost:3000/api/verifyaccess', {
            credentials: 'include'
        });
        const access = await response.text();
        console.log(access);
        if (access === 'invalid') {
            navigate('/register');
            return;
        }
        setLoading(false);
    }

    function logOut() {
        fetch('http://localhost:3000/api/logout', {
            credentials: 'include'
        });
        setLoading(true);
        navigate('/register');
    }

    useEffect(() => {
        document.body.classList.toggle('dark', dark)
        }, [dark]);

    useEffect(() => {
        verifyaccess();
    }, []);

    if (loading) {
        return (
            <p>Loading...</p>
        );
    } 
    return (
        <>
            <div className={styles.headerBackgroundImage}></div>
            <main className={styles.mainContainer}>
                <section className={styles.headerContainer}>
                    <p className={styles.headerText}>TODO</p>
                    <div className={styles.headerMoonImage} onClick={() => setDark(dark => !dark)}></div>
                </section>
                <EnterTaskForm setTask={setTask} />
                <TaskContainer task={task} />
                <p onClick={logOut}>log out</p>
            </main>
        </>
    );
}

export default App;