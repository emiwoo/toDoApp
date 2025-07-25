import styles from './modules/TaskContainer.module.css';
import Task from './Task.jsx';
import { useState, useEffect } from 'react';


function TaskContainer({task}) {
    const [filter, setFilter] = useState('all');
    const [loadedTasks, setLoadedTasks] = useState([]);

    async function sendTaskToDatabase(task) {
        const response = await fetch('https://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/sendtasktodatabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: task}),
            credentials: 'include'
        });
        const body = await response.json();
        loadTasks('all');
    }

    async function loadTasks(filter) {
        const response = await fetch(`https://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/loadtasks/${filter}`, {
            credentials: 'include'
        });
        const body = await response.json();
        setLoadedTasks(body);
    }

    async function deleteTask(id) {
        await fetch(`https://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/deletetask/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadTasks('all');
    }

    function toggleTaskStatus(id) {
        fetch(`https://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/toggleTaskStatus/${id}`, {
            method: 'PUT',
            credentials: 'include'
        });
    }

    async function clearCompleted() {
        await fetch('https://ec2-3-17-110-48.us-east-2.compute.amazonaws.com/api/clearcompleted', { 
            method: 'DELETE',
            credentials: 'include'
        });
        loadTasks('all');
    }

    useEffect(() => {
        if (task !== '') {
            sendTaskToDatabase(task);
        }
    }, [task]);

    useEffect(() => {
        loadTasks('all');
    }, []);

    return (
        <>
            <article className={styles.taskContainer}>
                {loadedTasks.map(task => (
                    <Task name={task.name} is_complete={task.is_complete} key={task.id} id= {task.id} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask}/>
                ))}
                <section className={styles.counterAndClear}>
                    <p>{loadedTasks.length} items left</p>
                    <p className={styles.clearCompleted} onClick={clearCompleted}>Clear completed</p>
                </section>
            </article>
            <article className={styles.filterContainer}>
                <p className={`${filter === 'all' ? styles.currentFilter : ''}`} onClick={() => {
                    loadTasks('all');
                    setFilter('all');
                }}>All</p>
                <p className={`${filter === 'active' ? styles.currentFilter : ''}`} onClick={() => {
                    loadTasks('active');
                    setFilter('active');
                }}>Active</p>
                <p className={`${filter === 'completed' ? styles.currentFilter : ''}`} onClick={() => {
                    loadTasks('completed');
                    setFilter('completed');
                }}>Completed</p>
            </article>
        </>
    );
}

export default TaskContainer;