// Coded by Aakar Gupta
import { useState, useEffect, useMemo } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


function App() {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'important'
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    const newTask = { id: Date.now(), text: inputValue, completed: false, isImportant: false };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
        tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        )
    );
  };

  const handleToggleImportant = (taskId) => {
    setTasks(
        tasks.map(task =>
            task.id === taskId ? { ...task, isImportant: !task.isImportant } : task
        )
    );
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleSaveEdit = (taskId) => {
    if (editingTaskText.trim() === '') return;
    setTasks(
        tasks.map(task =>
            task.id === taskId ? { ...task, text: editingTaskText } : task
        )
    );
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleEditInputChange = (e) => {
    setEditingTaskText(e.target.value);
  };

  const handleEditKeyDown = (e, taskId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingTaskText('');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'important':
        return tasks.filter(task => task.isImportant);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
      <div className="app">
        <header className="header">
          <h1>To-Do-List-App</h1>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '☽' : '☀'}
          </button>
        </header>

        <form onSubmit={handleAddTask} className="todo-form">
          <input
              type="text"
              className="todo-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add your tasks here ..."
          />
          <button type="submit" className="add-btn">Add</button>
        </form>

        <div className="filters">
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter('active')} className={`filter-btn ${filter === 'active' ? 'active' : ''}`}>Active</button>
          <button onClick={() => setFilter('completed')} className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}>Completed</button>
          <button onClick={() => setFilter('important')} className={`filter-btn ${filter === 'important' ? 'active' : ''}`}>Important</button>
        </div>

        <ul className="todo-list">
          {filteredTasks.map(task => (
              <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''} ${task.isImportant ? 'important' : ''}`}>
                {editingTaskId === task.id ? (
                    <>
                      <input
                          type="text"
                          value={editingTaskText}
                          onChange={handleEditInputChange}
                          onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                          className="edit-input"
                          autoFocus
                      />
                      <div className="task-buttons">
                        <button onClick={() => handleSaveEdit(task.id)} className="action-btn save-btn">✔</button>
                      </div>
                    </>
                ) : (
                    <>
                <span onClick={() => handleToggleComplete(task.id)}>
                  {task.text}
                </span>
                      <div className="task-buttons">
                        <button onClick={() => handleToggleImportant(task.id)} className={`action-btn star-btn ${task.isImportant ? 'important' : ''}`}>
                          {task.isImportant ? '★' : '☆'}
                        </button>
                        <button onClick={() => handleStartEdit(task)} className="action-btn edit-btn">✎</button>
                        <button onClick={() => handleDeleteTask(task.id)} className="action-btn delete-btn">
                          &times;
                        </button>
                      </div>
                    </>
                )}
              </li>
          ))}
        </ul>

        <footer className="footer">
          Made by <a href="https://github.com/aakargupta-coder" target="_blank" rel="noopener noreferrer">Aakar Gupta</a> - 24BRS1321
        </footer>
      </div>
  );
}

export default App;