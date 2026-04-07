export const generatePassword = (length: number = 8): string => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

export const setEndDate = (endDate : string) => {
    const d = new Date(endDate);
    d.setHours(23, 59, 59, 999);
      
    return d;
}

export const setStartDate = (startDate : string) => {
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    return d;
}