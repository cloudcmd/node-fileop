export default () => {
    const {
        origin,
        protocol,
        host,
    } = location;
    
    return origin || `${protocol}//${host}`;
};
