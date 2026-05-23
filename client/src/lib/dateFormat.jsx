export const dateFormat = (date) => {
    return new Date(date).toLocaleString('en-US', {
        month: 'long',
        weekday: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        
    })
}