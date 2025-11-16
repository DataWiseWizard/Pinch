import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import API_URL from '../apiConfig';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';

const PinDetail = () => {
    const { id } = useParams();
    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPin = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/pins/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPin(data);
            } catch (error) {
                console.error('Error fetching pin:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPin();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>

        );
    }

    if (error || !pin) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <h1 className="text-2xl text-destructive">Error: Pin not found.</h1>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 rounded-lg overflow-hidden shadow-xl bg-card">
                    <div className="md:col-span-7 lg:col-span-8 bg-black/50">
                        <img
                            src={pin.image.url}
                            alt={pin.title}
                            className="w-full h-auto max-h-[85vh] object-contain"
                        />
                    </div>
                    <div className="md:col-span-5 lg:col-span-4 p-6 flex flex-col">
                        <h1 className="text-3xl lg:text-4xl font-bold break-words mb-4">
                            {pin.title}
                        </h1>
                        {pin.destination && (
                            <p className="text-base text-muted-foreground break-all mb-4">
                                From: {pin.destination}
                            </p>
                        )}
                        <div className="flex-grow" />
                        {pin.postedBy && (
                            <p className="text-lg text-muted-foreground mt-4">
                                Posted by: {' '}
                                <RouterLink
                                    to={`/user/${pin.postedBy._id}`}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {pin.postedBy.username}
                                </RouterLink>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="my-4 max-w-6xl mx-auto" />
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <CommentSection pinId={id} />
            </div>
        </>
    );
};

export default PinDetail;