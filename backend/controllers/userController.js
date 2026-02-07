import db from '../config/firestore.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.id).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            res.json({
                id: userDoc.id,
                firebaseUid: userData.firebaseUid,
                name: userData.name,
                email: userData.email,
                image: userData.image,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.id);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const updateData = {
                updatedAt: new Date()
            };

            if (req.body.name) updateData.name = req.body.name;
            if (req.body.email) updateData.email = req.body.email;
            if (req.body.image) updateData.image = req.body.image;

            await userRef.update(updateData);

            const updatedDoc = await userRef.get();
            const userData = updatedDoc.data();

            res.json({
                id: updatedDoc.id,
                firebaseUid: userData.firebaseUid,
                name: userData.name,
                email: userData.email,
                image: userData.image,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUserProfile, updateUserProfile };
