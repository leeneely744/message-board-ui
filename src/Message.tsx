export function Message({
    message,
    timestamp,
    isAuthor,
    handleEdit,
    handleDelete,
}) {
    var tsForLi = "at " + new Date(Number(timestamp) * 1000).toLocaleString();
    return (
        <li>
            {message} {tsForLi} {isAuthor && 
                <>
                    <button type="button" onClick={handleEdit}>Edit</button>
                    <button type="button" onClick={handleDelete}>Delete</button>
                </>
            }
        </li>
    )
}
