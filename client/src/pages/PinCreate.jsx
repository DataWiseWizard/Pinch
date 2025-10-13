import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PinCreate = () => {
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !image) {
            setError("Please fill in all fields");
            return;
        }

        const formData = new FormData();
        formData.append("pin[title]", title);
        formData.append("pin[destination]", destination);
        formData.append("pin[image]", image);

        try {
            const response = await fetch("/pins", {
                method: "post",
                body: formData
            })
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            navigate("/");
        } catch (err) {
            setError(err.message);
            console.error('Error creating pin:', err);
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Create a New Pin</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="destination">Destination</label>
                    <textarea
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter destination URL"
                        rows="3"
                        style={{ width: '100%', padding: '8px' }}
                    ></textarea>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="image">Upload Image</label>
                    <input
                        type="file"
                        id="image"
                        onChange={(e) => setImage(e.target.files[0])}
                        accept="image/*"
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '10px 20px' }}>Add Pin</button>
            </form>
        </div>
    );
}


    export default PinCreate;