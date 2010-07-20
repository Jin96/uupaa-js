    return <>
    <div {{arg.DualBraceStyle}}>
        <ul>
            <each arg.list>
                <li {{arg.ListStyle}}>{{key}}</li>
                <li>{{value}}</li>
            </each>
        </ul>
    </div>
