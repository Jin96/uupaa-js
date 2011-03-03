    return <>
    <div {{arg.DualBraceStyle}}>
        <ul>
            <each arg.list_outer_src>
                <li {{arg.ListStyle}}>{{key}}</li>
                <li>{{value}}</li>
            </each>
        </ul>
    </div>
</>
