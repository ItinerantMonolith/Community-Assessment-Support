const codeReference = {}

const typeDisplay = { 
    number: 'Number',
    percent: 'Percentage: data elements are totalled and divided by the overall Total',
    sum: 'Total: all data elements are added together',
    sumPct: 'Percentage: data elements are totalled and divided by the overall Total',
    string: 'String',
    decimal: 'Number with a single decimal point',
    dollars: 'Number with a preceding $'
    }

const clearHeaders = () => {
    const headers = document.querySelectorAll( '.divTableHeader' )
    headers.forEach( e => { e.classList.remove( 'selectedCell' ) } )
}

const clearDetails = () => {
    const detailRow = document.getElementById( 'detailRow' )
    while ( detailRow.children.length )
        detailRow.lastChild.remove()
}

const addDiv = ( text, className, target, asHTML = false ) => {
    const newDiv = document.createElement( 'div' )
    if ( text ) {
        if ( asHTML )
            newDiv.innerHTML = text
        else
            newDiv.innerText = text
    }
        
    if ( className )
        newDiv.className = className
    target.appendChild ( newDiv )
}

const showDataDetail = ( fieldIndex, fieldCell ) => {
    clearDetails()
    clearHeaders()
    
    const detailRow = document.getElementById( 'detailRow' )
    fieldCell.classList.add ( 'selectedCell' )

    const field = REPORTS[ document.getElementById( 'selectReport' ).value ].fields[ fieldIndex ]

    addDiv ( `<strong>Field Type: </strong>${typeDisplay[field.type]}`, '', detailRow, true )

    const dataTable = document.createElement( 'div' )
    dataTable.className = 'dataTable'

    addDiv ( 'Data Code', 'divTableCell dataTableHeader', dataTable )
    addDiv ( 'Source Table Concept', 'divTableCell dataTableHeader', dataTable )
    addDiv ( 'Data Label', 'divTableCell dataTableHeader', dataTable )

    field.code.split(',').forEach ( code => {
        const codeDetail = codeReference[ code ].label.split('!!')
        codeDetail.shift()  // remove "Estimate"
        const baseCode = code.substring(0, code.indexOf('_') )
        const codeRef = `${CB_STATIC_BASE}${baseCode}${CB_STATIC_SET}${baseCode}`
        
        addDiv ( `<a href="${codeRef}" target="_blank">${code}</a>`, 'divTableCell', dataTable, true )
        addDiv ( `${codeReference[ code ].concept}`, 'divTableCell', dataTable )
        addDiv ( `${codeDetail.join(', ')}`, 'divTableCell', dataTable )
    })
    
    detailRow.appendChild ( dataTable )
}


const displayReport = () => {
    const reportDisplay = document.querySelector( '#reportDisplay' )
    while ( reportDisplay.children.length ) 
        reportDisplay.lastChild.remove()


    const report = REPORTS[ document.getElementById( 'selectReport' ).value ]

    const tableDiv = document.createElement( 'div' )
    tableDiv.className = 'divTable'
    tableDiv.style.gridTemplateColumns = '1fr '.repeat( report.fields.length );

    // give the report a title
    const newTitle = document.createElement ( 'div' )
    newTitle.className = 'divTableTitle'
    newTitle.innerText = report.name
    newTitle.style.gridColumn = `span ${report.fields.length}`
    tableDiv.appendChild( newTitle )

    const newType = document.createElement ( 'div' )
    newType.innerHTML = `<em>${report.isTrend ? 'Trend Report (most recent 5 years)' : 'Single Year Report'}</em>`
    newType.style.gridColumn =  `span ${report.fields.length}`
    tableDiv.appendChild( newType )

    report.fields.forEach ( (field, index) => {
        let newCell = document.createElement( 'div' )
        newCell.innerText = field.name
        newCell.className = 'divTableCell divTableHeader divReportDetail'
        newCell.addEventListener( 'click', (e) => { 
            showDataDetail ( index, e.target) 
        } )
        tableDiv.appendChild( newCell )
    })
    
    let detailRow = document.createElement( 'div' )
    detailRow.className = 'divTableCell'
    detailRow.id = 'detailRow'
    detailRow.style.gridColumn = `span ${report.fields.length}`
    tableDiv.appendChild( detailRow )

    reportDisplay.appendChild( tableDiv )
}



const refreshReportSelection = () => {
    const reportSelect = document.getElementById( 'selectReport' )
    reportSelect.length = 0
    REPORTS.forEach( (e,i) => {
        let newReport = document.createElement ( 'option' )
        newReport.innerText = e.name
        newReport.value = i
        reportSelect.add ( newReport )
    })

    reportSelect.selectedIndex = -1
    reportSelect.addEventListener( 'change', displayReport )   
}


const getVariables = async () => {
    // we need to pull the master variable list one time, then trim it down to the codes that we care about.
    // if later on we extend this to dynamically building reports, we'll need these variables/codes.
    try {
        const resp = await axios.get ( 'https://api.census.gov/data/2018/acs/acs5/variables.json' )

        REPORTS.forEach( rep => {
            rep.fields.forEach ( field => {
                field.code.split(',').forEach ( code => {
                    codeReference[ code ] = resp.data.variables[ code ]
                })
            })
        })
    }
    catch (error ) {
        console.log ( error )
    }    
    
}

window.onload = () => {
    refreshReportSelection()

    getVariables()
}

