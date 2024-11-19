"use client";
// @ts-ignore
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

const TawkChat = () => {
    return (
        <TawkMessengerReact
            propertyId={process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}
            widgetId={process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}
        />
    );
};

export default TawkChat;
