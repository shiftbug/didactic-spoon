const Sidebar = ({ recentFiles }) => {
    return (
        <aside className="sidebar">
            {/* <!-- Menu section with list of recent files --> */}
            <div className="menu">
                <h2>Menu Items</h2>
                {/* <!-- Unordered list where recent files will be dynamically loaded --> */}
                <ul id="recent-files">
                    {/* <!-- Placeholder comment where JavaScript will insert recent files --> */}
                </ul>
            </div>
            {/* <!-- Section for displaying recent documents --> */}
            <div className="recent-docs">
                <h2>Recents</h2>
                {/* <!-- Unordered list for recent documents, to be populated by JavaScript --> */}
                <ul>
                    {/* <!-- Placeholder comment for list of recent documents --> */}
                </ul>
            </div>
            <div className="recent-docs">
                <ul>
                    {recentFiles.length > 0 ? recentFiles.map((file, index) => (
                        <li key={index} onClick={() => console.log('Loading file', file)}>{file}</li>
                    )) : <li>No recent documents</li>}
                </ul>
            </div>
        </aside>
    )
}

export default Sidebar