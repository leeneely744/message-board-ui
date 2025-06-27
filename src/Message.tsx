export function Message({ index, message, timestamp, isAuthor }) {
    var tsForLi = "at " + new Date(Number(timestamp) * 1000).toLocaleString();
    return (
        <li key={index}>
            {message} {tsForLi} {isAuthor && 
                <>
                    <button>Edit</button>
                    <button>Delete</button>
                </>
            }
        </li>
    )
}
