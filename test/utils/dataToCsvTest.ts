import { expect } from 'chai'
import { getCsvContentFromData } from '../../src/utils/dataToCsv'

describe('Data To CSV Util', () => {
    it('should turn data into CSV text', () => {
        const data = [
            [{text: "1AM"}, {text: "0"}],
            [{text: "2AM"}, {text: "1"}],
            [{text: "3AM"}, {text: "2"}]
        ]

        const fields = [
            {name: "time", type: "text"},
            {name: "completions", type: "number"}
        ]

        const expectedCsvContent = `"time","completions"
"1AM",0
"2AM",1
"3AM",2`

        const actualCsvContent = getCsvContentFromData(data, fields)

        expect(actualCsvContent).to.eql(expectedCsvContent)
    })
})