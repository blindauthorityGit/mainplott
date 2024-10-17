import React from "react";

const MainContainer = React.forwardRef(({ children, width, id, klasse, ...props }, ref) => {
    return (
        <main
            ref={ref}
            id={id}
            className={`mx-auto container lg:container 3xl:max-h-full ${klasse} ${width}`}
            {...props}
        >
            {children}
        </main>
    );
});

// Add a display name to the component
MainContainer.displayName = "MainContainer";

export default MainContainer;
