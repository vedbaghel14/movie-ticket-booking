const axios = require('axios')

const GEOAPIFY_BASE = 'https://api.geoapify.com/v2/places'

// ---- GET /api/theatres/nearby?lat=...&lng=... ----
const getNearbyTheatres = async (req, res) => {
    try {
        const { lat, lng } = req.query

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng query parameters are required' })
        }

        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ message: 'lat and lng must be valid numbers' })
        }

        const response = await axios.get(GEOAPIFY_BASE, {
            params: {
                categories: 'entertainment.cinema',
                filter: `circle:${userLng},${userLat},20000`, // 20 km radius
                bias: `proximity:${userLng},${userLat}`,
                limit: 20,
                apiKey: process.env.GEOAPIFY_API_KEY,
            },
        })

        const theatres = (response.data.features || []).map((feature) => {
            const props = feature.properties || {}
            return {
                fsq_id: props.place_id,
                name: props.name || 'Unknown Theatre',
                location: {
                    formatted_address:
                        props.formatted ||
                        props.address_line1 ||
                        props.address_line2 ||
                        '',
                },
                distance: props.distance || 0,
                rating: props.rating || null,
                tel: props.contact?.phone || null,
            }
        })

        res.json({ theatres })
    } catch (error) {
        console.error('Geoapify API error:', error.response?.data || error.message)
        res.status(500).json({ message: 'Failed to fetch nearby theatres' })
    }
}

module.exports = { getNearbyTheatres }