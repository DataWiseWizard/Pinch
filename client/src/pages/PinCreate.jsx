import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, Upload } from "lucide-react";

const PinCreate = () => {
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("");
    const [aiImageUrl, setAiImageUrl] = useState(""); // URL string (for AI)
    const [aiFilename, setAiFilename] = useState(""); // Filename from Cloudinary

    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'ai'

    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            // Clear AI state if user picks a file
            setAiImageUrl("");
            setAiFilename("");
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError("");

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/pins/generate-ai`, {
                method: "POST",
                headers,
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            setAiImageUrl(data.url);
            setAiFilename(data.filename);

            if (!title) setTitle(prompt);
            setImage(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || (!image && !aiImageUrl)) {
            setError("Please fill in all required fields");
            return;
        }
        setError("");
        setSubmitting(true);

        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();

            formData.append("pin[title]", title);
            if (destination) formData.append("pin[destination]", destination);

            if (activeTab === 'upload' && image) {
                formData.append("pin[image]", image);
            } else if (activeTab === 'ai' && aiImageUrl) {
                formData.append("aiImageUrl", aiImageUrl);
                formData.append("aiFilename", aiFilename);
            } else {
                throw new Error("No image selected");
            }

            delete headers['Content-Type'];

            const response = await fetch(`${API_URL}/pins`, {
                method: "POST",
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create pin");
            }
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center py-12 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Create a New Pin</CardTitle>
                    <CardDescription>Share an image or generate one with AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
                            <TabsTrigger value="ai"><Wand2 className="w-4 h-4 mr-2" /> Create with AI</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <div className="grid gap-2">
                                <Label htmlFor="image-upload">Choose File</Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={submitting}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="ai">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="A cyberpunk city with neon lights..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isGenerating || submitting}
                                />
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt}
                                >
                                    {isGenerating ? <p className="animate-spin">Loading</p> : "Generate"}
                                </Button>
                            </div>
                            {aiImageUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden border">
                                    <img src={aiImageUrl} alt="Generated" className="w-full h-auto" />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={submitting}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="destination">Link (Optional)</Label>
                            <Input
                                id="destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                disabled={submitting}
                                placeholder="https://..."
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Pin"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    //old mui way
    // return (
    //     <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}> {/* Smaller container for forms */}
    //         <Box
    //             sx={{
    //                 marginTop: 8,
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //             }}
    //         >
    //             <Typography component="h1" variant="h5" gutterBottom>
    //                 Create a New Pin
    //             </Typography>

    //             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     id="title"
    //                     label="Title"
    //                     name="title"
    //                     autoFocus
    //                     value={title}
    //                     onChange={(e) => setTitle(e.target.value)}
    //                     disabled={submitting}
    //                 />
    //                 <TextField
    //                     margin="normal"
    //                     fullWidth // Not required
    //                     id="destination"
    //                     label="Destination URL (Optional)"
    //                     name="destination"
    //                     value={destination}
    //                     onChange={(e) => setDestination(e.target.value)}
    //                     disabled={submitting}
    //                     type="url" // Hint for URL input
    //                 />

    //                 {/* File Input */}
    //                 <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
    //                     <Button
    //                         variant="outlined"
    //                         component="label" // Makes the button act as a label for the hidden input
    //                         fullWidth
    //                         startIcon={<CloudUploadIcon />}
    //                         disabled={submitting}
    //                     >
    //                         Upload Image *
    //                         <input
    //                             type="file"
    //                             hidden // Hide the default ugly input
    //                             onChange={handleImageChange}
    //                             accept="image/*" // Specify acceptable file types
    //                             required
    //                         />
    //                     </Button>
    //                     {imageName && (
    //                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
    //                             Selected: {imageName}
    //                         </Typography>
    //                     )}
    //                 </Box>


    //                 {error && (
    //                     <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
    //                         {error}
    //                     </Alert>
    //                 )}

    //                 <Button
    //                     type="submit"
    //                     fullWidth
    //                     variant="contained"
    //                     sx={{ mt: 3, mb: 2 }}
    //                     disabled={submitting || !image || !title} // Disable if submitting or required fields empty
    //                 >
    //                     {submitting ? <CircularProgress size={24} color="inherit" /> : "Add Pin"}
    //                 </Button>
    //             </Box>
    //         </Box>
    //     </Container>
    // );
}


export default PinCreate;