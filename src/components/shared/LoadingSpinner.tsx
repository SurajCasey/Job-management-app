interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    message?: string;
}

const LoadingSpinner = ({ 
    size = 'md', 
    fullScreen = false,
    message = 'Loading...'
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'h-8 w-8 border-2',
        md: 'h-16 w-16 border-4',
        lg: 'h-24 w-24 border-4',
    };

    const content = (
        <div className="text-center">
            <div 
                className={`animate-spin rounded-full border-t-blue-600 border-b-purple-600 
                border-l-transparent border-r-transparent mx-auto mb-4 ${sizeClasses[size]}`}
            />
            {message && <p className="text-gray-700 font-medium text-2xl">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;
