import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Optional icon
import CircularProgress from '@mui/material/CircularProgress';


const PinCreate = () => {
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setImageName(e.target.files[0].name);
        } else {
            setImage(null);
            setImageName("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !image) {
            setError("Please fill in all required fields");
            return;
        }
        setError("");
        setSubmitting(true);

        const formData = new FormData();
        formData.append("pin[title]", title);
        if (destination) {
            formData.append("pin[destination]", destination);
        }
        formData.append("pin[image]", image);

        try {
            const headers = await getAuthHeaders();
            // Remove Content-Type header for FormData (browser sets it automatically)
            delete headers['Content-Type'];

            const response = await fetch(`${API_URL}/pins`, {
                method: "POST",
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create pin. Please check your input.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            navigate("/");
        } catch (err) {
            setError(err.message);
            console.error('Error creating pin:', err);
        } finally {
            setSubmitting(false);
        }
    }

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!title || !image) {
    //         setError("Please fill in all fields");
    //         return;
    //     }
    //     setError("");
    //     setSubmitting(true);

    //     const formData = new FormData();
    //     formData.append("pin[title]", title);
    //     if (destination) {
    //         formData.append("pin[destination]", destination);
    //     } formData.append("pin[image]", image);

    //     try {
    //         const response = await fetch(`${API_URL}/pins`, {
    //             method: "post",
    //             body: formData
    //         })
    //         if (!response.ok) {
    //             const errorData = await response.json().catch(() => ({ message: 'Failed to create pin. Please check your input.' }));
    //             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    //         }
    //         navigate("/");
    //     } catch (err) {
    //         setError(err.message);
    //         console.error('Error creating pin:', err);
    //     } finally {
    //         setSubmitting(false);
    //     }
    // }

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}> {/* Smaller container for forms */}
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" gutterBottom>
                    Create a New Pin
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="title"
                        label="Title"
                        name="title"
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={submitting}
                    />
                    <TextField
                        margin="normal"
                        fullWidth // Not required
                        id="destination"
                        label="Destination URL (Optional)"
                        name="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        disabled={submitting}
                        type="url" // Hint for URL input
                    />

                    {/* File Input */}
                    <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
                        <Button
                            variant="outlined"
                            component="label" // Makes the button act as a label for the hidden input
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            disabled={submitting}
                        >
                            Upload Image *
                            <input
                                type="file"
                                hidden // Hide the default ugly input
                                onChange={handleImageChange}
                                accept="image/*" // Specify acceptable file types
                                required
                            />
                        </Button>
                        {imageName && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                Selected: {imageName}
                            </Typography>
                        )}
                    </Box>


                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={submitting || !image || !title} // Disable if submitting or required fields empty
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "Add Pin"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}


export default PinCreate;