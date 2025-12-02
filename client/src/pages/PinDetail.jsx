import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import API_URL from '../apiConfig';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import Pin from '@/components/Pin'; // Reuse your Pin component for the sidebar!
import Masonry from 'react-masonry-css';
import '../components/PinList.css'; // Ensure we have the masonry styles

const PinDetail = () => {
    const { id } = useParams();
    const [pin, setPin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPins, setRelatedPins] = useState([]);
    const { getAuthHeaders } = useAuth();

    useEffect(() => {
        const fetchPin = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${API_URL}/pins/${id}`, {
                    headers: headers
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPin(data.pin);
                setRelatedPins(data.relatedPins || []);
            } catch (error) {
                console.error('Error fetching pin:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPin();
        window.scrollTo(0, 0);
    }, [id, getAuthHeaders]);

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
        <div className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col xl:flex-row gap-8">

                {/* --- LEFT COLUMN: Main Pin & Comments --- */}
                <div className="flex-1 min-w-0">
                    {/* Main Pin Card */}
                    <div className="bg-card rounded-3xl shadow-lg overflow-hidden mb-8 border border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Image Side */}
                            <div className="bg-black/5 flex items-center justify-center p-4">
                                <img
                                    src={pin.image.url}
                                    alt={pin.title}
                                    className="rounded-xl max-h-[80vh] w-auto object-contain shadow-sm"
                                />
                            </div>

                            {/* Text/Info Side */}
                            <div className="p-6 md:p-8 flex flex-col">
                                <div className="flex-grow">
                                    <h1 className="text-3xl md:text-4xl font-bold break-words mb-4 leading-tight">
                                        {pin.title}
                                    </h1>

                                    {pin.destination && (
                                        <a
                                            href={pin.destination}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block text-sm text-muted-foreground hover:text-primary underline mb-6 truncate max-w-full"
                                        >
                                            {pin.destination}
                                        </a>
                                    )}

                                    {pin.tags && pin.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {pin.tags.map(tag => (
                                                <RouterLink
                                                    key={tag}
                                                    to={`/search?q=${encodeURIComponent(tag)}`} // Links to your search page
                                                    className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium hover:bg-secondary transition-colors cursor-pointer"
                                                >
                                                    #{tag}
                                                </RouterLink>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                {pin.postedBy && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                            <img
                                                src={pin.postedBy.profileImage || '/broken-image.jpg'}
                                                alt={pin.postedBy.username}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Posted by</p>
                                            <RouterLink
                                                to={`/user/${pin.postedBy.username}`}
                                                className="font-bold text-lg hover:underline"
                                            >
                                                {pin.postedBy.username}
                                            </RouterLink>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6 md:p-8">
                        <CommentSection pinId={id} />
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Related Pins (Sidebar) --- */}
                {relatedPins.length > 0 && (
                    <aside className="w-full xl:w-[400px] 2xl:w-[450px] shrink-0">
                        <div className="sticky top-24">
                            <h3 className="text-xl font-bold mb-4 px-2">More like this</h3>
                            <Masonry
                                breakpointCols={{ default: 2 }}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {relatedPins.map(related => (
                                    <div key={related._id} className="mb-4">
                                        <Pin
                                            pin={related}
                                            // We pass null for actions to keep the sidebar clean,
                                            // or you can pass your handleSave function if you want saving here too.
                                            onSave={null}
                                            isSaved={false}
                                        />
                                        <p className="text-xs font-medium mt-1 ml-1 text-muted-foreground truncate">
                                            {related.title}
                                        </p>
                                    </div>
                                ))}
                            </Masonry>
                        </div>
                    </aside>
                )}

            </div>
        </div >
    );

    // return (
    //     <>
    //         <div className="max-w-6xl mx-auto p-4 md:p-8">
    //             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 rounded-lg overflow-hidden shadow-xl bg-card">
    //                 <div className="md:col-span-7 lg:col-span-8 bg-black/50">
    //                     <img
    //                         src={pin.image.url}
    //                         alt={pin.title}
    //                         className="w-full h-auto max-h-[85vh] object-contain"
    //                     />
    //                 </div>
    //                 <div className="md:col-span-5 lg:col-span-4 p-6 flex flex-col">
    //                     <h1 className="text-3xl lg:text-4xl font-bold break-words mb-4">
    //                         {pin.title}
    //                     </h1>
    //                     {pin.destination && (
    //                         <p className="text-base text-muted-foreground break-all mb-4">
    //                             From: {pin.destination}
    //                         </p>
    //                     )}
    //                     <div className="flex-grow" />
    //                     {pin.postedBy && (
    //                         <p className="text-lg text-muted-foreground mt-4">
    //                             Posted by: {' '}
    //                             <RouterLink
    //                                 to={`/user/${pin.postedBy.username}`}
    //                                 className="font-semibold text-primary hover:underline"
    //                             >
    //                                 {pin.postedBy.username}
    //                             </RouterLink>
    //                         </p>
    //                     )}
    //                 </div>
    //             </div>
    //         </div>

    //         {/* --- VISUAL SEARCH GRID --- */}
    //         {relatedPins.length > 0 && (
    //             <div className="mt-12 mb-8">
    //                 <h3 className="text-xl font-bold mb-4">More like this</h3>
    //                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    //                     {relatedPins.map(related => (
    //                         <RouterLink to={`/pins/${related._id}`} key={related._id} className="block group">
    //                             <div className="rounded-lg overflow-hidden aspect-[2/3]">
    //                                 <img
    //                                     src={related.image.url}
    //                                     alt={related.title}
    //                                     className="w-full h-full object-cover transition-transform group-hover:scale-105"
    //                                 />
    //                             </div>
    //                             <p className="font-medium text-sm mt-2 truncate">{related.title}</p>
    //                         </RouterLink>
    //                     ))}
    //                 </div>
    //             </div>
    //         )}

    //         <Separator className="my-4 max-w-6xl mx-auto" />
    //         <div className="max-w-6xl mx-auto px-4 md:px-8">
    //             <CommentSection pinId={id} />
    //         </div>
    //     </>
    // );
};

export default PinDetail;