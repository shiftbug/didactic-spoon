import { useState } from "react"

const Module = () => {
    const [prompts, setPrompts] = useState({
        "conflicting-views": {
            label: "Conflicting Views",
            text: "Lorem ipsum",
        },
        "reader-expectations": {
            label: "Reader Expectations",
            text: "Blah",
        },
    })

    // setPrompts(...prompts, [new one])
    console.log(prompts)
    return (
        <div className="module">
            <div className="module-header">
                <h3 className="title"></h3>
                <label className="toggle-module">
                    <input type="checkbox" className="module-checkbox" /> Active
                </label>
                <select className="prompt-select">
                    {Object.keys(prompts).map((promptKey) => {
                        return <option value={promptKey}>{prompts[promptKey].label}</option>
                    })}
                </select>
                {/* <div>{prompts[selectedPromptKey].text}</div> */}
            </div>
            <textarea className="module-output" rows="5" cols="50" readOnly></textarea>

        </div>
    )
}

export default Module