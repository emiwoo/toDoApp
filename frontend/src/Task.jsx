    import styles from './modules/Task.module.css';
    import xImage from './assets/icon-cross.svg';
    import { useState, useEffect } from 'react';

    function Task({ name, is_complete, id, deleteTask, toggleTaskStatus}) {
        const [complete, setComplete] = useState(false);

        useEffect(() => {
            setComplete(is_complete);
        }, [is_complete]);

        return (
            <section className={styles.taskHolder}>
                <div className={styles.leftSideContainer}>
                    <div className={`${styles.taskCircle} ${complete ? styles.taskCircleCompleted : ''}`} onClick={() => {
                        toggleTaskStatus(id);
                        setComplete(complete => !complete);
                    }}></div>
                    <p className={styles.taskText}>{name}</p>
                </div>
                <img src={xImage} className={styles.taskXImage} onClick={() => deleteTask(id)}/>
            </section>
        );
    }

    export default Task;