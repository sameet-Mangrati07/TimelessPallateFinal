export const extractUserAgent = (userAgent) => {
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);

    const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);

    const windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);

    let formattedUserAgent = "";

    if (windowsMatch) {
        formattedUserAgent += `Windows NT ${windowsMatch[1]} | `;
    }

    if (chromeMatch) {
        formattedUserAgent += `Chrome/${chromeMatch[1]} | `;
    }

    if (edgeMatch) {
        formattedUserAgent += `Edg/${edgeMatch[1]}`;
    }

    return formattedUserAgent.trim();
}
