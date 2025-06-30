import styles from './modules/EnterTaskForm.module.css';
import { useState } from 'react';

function EnterTaskForm({setTask}) {
    const [taskName, setTaskName] = useState('');

    function createTask(event) {
        event.preventDefault();
        setTask(taskName);
        setTaskName('');
    }

    return (
        <form className={styles.formContainer} onSubmit={createTask}>
            <div className={styles.formCircle}></div>
            <input placeholder="Create a new todo..." 
                className={styles.formText}
                onChange={(event) => setTaskName(event.target.value)}
                value={taskName}
            />
        </form>
    );
}

export default EnterTaskForm;