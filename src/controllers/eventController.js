const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
    try {
        console.log('[Events] Create event request:', {
            user: req.session?.user?.id || 'not authenticated',
            body: { ...req.body, description: req.body.description?.substring(0, 20) + '...' }
        });
        
        if (!req.session?.user?.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        const { title, description, date, time, location, category } = req.body;
        
        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            category,
            organizer: req.session.user.id
        });

        await event.save();
        console.log('[Events] Event created successfully:', event._id);
        res.status(201).json({ 
            success: true,
            message: 'Event created successfully', 
            event 
        });
    } catch (error) {
        console.error('[Events] Error creating event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating event' 
        });
    }
};

// Get all events
const getAllEvents = async (req, res) => {
    try {
        console.log('[Events] Getting all events');
        const events = await Event.find()
            .populate('organizer', 'username')
            .sort({ date: 1 });
        
        console.log(`[Events] Found ${events.length} events`);
        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('[Events] Error fetching events:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching events' 
        });
    }
};

// Get event by ID
const getEventById = async (req, res) => {
    try {
        console.log('[Events] Getting event by ID:', req.params.id);
        
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }
        
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'username')
            .populate('participants', 'username');
        
        if (!event) {
            console.log('[Events] Event not found:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }
        
        console.log('[Events] Found event:', event._id);
        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('[Events] Error fetching event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching event' 
        });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        console.log('[Events] Update event request:', {
            id: req.params.id,
            user: req.session?.user?.id || 'not authenticated'
        });
        
        if (!req.session?.user?.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            console.log('[Events] Event not found for update:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
            console.log('[Events] Update authorization failed');
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this event' 
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        console.log('[Events] Event updated successfully:', updatedEvent._id);
        res.json({ 
            success: true,
            message: 'Event updated successfully', 
            event: updatedEvent 
        });
    } catch (error) {
        console.error('[Events] Error updating event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating event'
        });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        console.log('[Events] Delete event request:', {
            id: req.params.id,
            user: req.session?.user?.id || 'not authenticated'
        });
        
        if (!req.session?.user?.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            console.log('[Events] Event not found for deletion:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
            console.log('[Events] Delete authorization failed');
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to delete this event' 
            });
        }

        // Use findByIdAndDelete instead of remove() which is deprecated
        await Event.findByIdAndDelete(req.params.id);
        console.log('[Events] Event deleted successfully:', req.params.id);
        
        res.json({ 
            success: true,
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('[Events] Error deleting event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting event'
        });
    }
};

// Join event
const joinEvent = async (req, res) => {
    try {
        console.log('[Events] Join event request:', {
            id: req.params.id,
            user: req.session?.user?.id || 'not authenticated'
        });
        
        if (!req.session?.user?.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            console.log('[Events] Event not found for joining:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Check if user is already a participant
        if (event.participants.some(id => id.toString() === req.session.user.id)) {
            console.log('[Events] User already joined event:', req.params.id);
            return res.status(400).json({ 
                success: false,
                message: 'Already joined this event' 
            });
        }

        event.participants.push(req.session.user.id);
        await event.save();

        console.log('[Events] User joined event successfully:', {
            event: req.params.id,
            user: req.session.user.id
        });
        
        res.json({ 
            success: true,
            message: 'Successfully joined event' 
        });
    } catch (error) {
        console.error('[Events] Error joining event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error joining event'
        });
    }
};

// Leave event
const leaveEvent = async (req, res) => {
    try {
        console.log('[Events] Leave event request:', {
            id: req.params.id,
            user: req.session?.user?.id || 'not authenticated'
        });
        
        if (!req.session?.user?.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            console.log('[Events] Event not found for leaving:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

        // Remove user from participants
        event.participants = event.participants.filter(
            participant => participant.toString() !== req.session.user.id
        );

        await event.save();
        
        console.log('[Events] User left event successfully:', {
            event: req.params.id,
            user: req.session.user.id
        });
        
        res.json({ 
            success: true,
            message: 'Successfully left event' 
        });
    } catch (error) {
        console.error('[Events] Error leaving event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error leaving event'
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent
}; 