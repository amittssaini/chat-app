import React, { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';

const socket = socketIO('http://localhost:8082', { transports: ['websocket'] });

const Chat = () => {
    const [totalClients, setTotalClients] = useState(0);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('anonymous');
    const [messages, setMessages] = useState([]);
    const [feedback,setFeedback]=useState('');

    useEffect(() => {
        socket.on('total-clients', (clientsCount) => {
            setTotalClients(clientsCount); // Listen for total-clients and update state
        });

        socket.on('chat-message', (data) => {
            console.log(data);
            setMessages((prevMsg) => [...prevMsg, data]);
        });

        socket.on('feedback',(data)=>{
            console.log(data);
            setFeedback(data);
            console.log(feedback)
        })

        return () => {
            socket.off('total-clients'); // Clean up on unmount
            socket.off('chat-message');
            socket.off('feedback')
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(message);

        // Create a new message object
        const newMessage = {
            UserName: 'own', // Indicate this is the user's message
            msg: message,
            date: new Date(),
        };

        // Update the messages state by appending the new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        sendMessage(); // Emit the message to the server
        setMessage(''); // Clear the input field
    };

    const sendMessage = () => {
        const data = {
            UserName: name,
            msg: message,
            date: new Date(),
        };
        console.log(data);
        socket.emit('message', data);
    };

    return (
        <div>
            <h1 className="title">iChat 💬</h1>
            <div className="main">
                <div className="name">
                    <span><i className="far fa-user"></i></span>
                    <input
          type="text"
          id="name-input"
          className="name-input"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          maxLength="20"
        />
                </div>

                <ul className="message-container" id="message-container">
                    {messages.map((msg, index) => (
                        <li key={index} className={msg.UserName === 'own' ? 'message-right' : 'message-left'}>
                            <p className="message">
                                {msg.msg}
                                <span>{msg.UserName} ● {msg.date.toLocaleString()}</span>
                            </p>
                        </li>
                    ))}

                    <li className="message-feedback">
                        {feedback===name?null:<p className="feedback" id="feedback">✍️ {feedback}</p>}
                        {/* <p className="feedback" id="feedback">✍️ {feedback}</p> */}
                    </li>
                </ul>

                <form className="message-form" id="message-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="message"
                        id="message-input"
                        className="message-input"
                        placeholder='Enter the Message'
                        value={message}
                        onChange={(e) => { setMessage(e.target.value);
                            socket.emit('feedback',`${name} is typing`)
                         }}
                         onFocus={() => socket.emit('feedback', `${name} is typing`)}
                       
                         onBlur={()=>socket.emit('feedback',``)}
                    
                    />
                    <div className="v-divider"></div>
                    <button type='submit' className="send-button">
                        send <span><i className="fas fa-paper-plane"></i></span>
                    </button>
                </form>
            </div>
            <h3 className="clients-total" id="client-total">Total clients: {totalClients}</h3>
        </div>
    );
};

export default Chat;
