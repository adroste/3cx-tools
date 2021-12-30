import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { CsvUpload } from './CsvUpload';
import { useTranslation } from 'react-i18next';

interface Contact {
  FirstName?: string,
  LastName?: string,
  Company?: string,
  Mobile?: string,
  Mobile2?: string,
  Home?: string,
  Home2?: string,
  Business?: string,
  Business2?: string,
  Email?: string,
  Other?: string,
  BusinessFax?: string,
  HomeFax?: string,
  Pager?: string, // stays undefined
}

const tcxHeaders = ['FirstName', 'LastName', 'Company', 'Mobile', 'Mobile2', 
  'Home', 'Home2', 'Business', 'Business2', 'Email', 'Other', 'BusinessFax', 
  'HomeFax', 'Pager'
] as const;

const tcxTypes = ['FirstName', 'LastName', 'Company', 'Mobile',
  'Home', 'Business', 'Email', 'Other', 'Fax'] as const;

// arrays are in order of fill priority
// if a field is already full it will try the next field
const tcxTypeFields = {
  'FirstName': ['FirstName'],
  'LastName': ['LastName'],
  'Company': ['Company'],
  'Mobile': ['Mobile', 'Mobile2', 'Home', 'Home2', 'Business', 'Business2', 'Other'],
  'Home': ['Home', 'Home2', 'Mobile', 'Mobile2', 'Business', 'Business2', 'Other'],
  'Business': ['Business', 'Business2', 'Mobile', 'Mobile2', 'Home', 'Home2', 'Other'],
  'Email': ['Email'],
  'Other': ['Other', 'Mobile', 'Mobile2', 'Home', 'Home2', 'Business', 'Business2'],
  'Fax': ['BusinessFax', 'HomeFax'],
} as const;

type TcxType = keyof typeof tcxTypeFields;

function generate3cxCsv(colMap: TcxType[], rows: string[][]): string {
  const contacts = rows.map(row => {
    const contact: Contact = {};
    row.forEach((entry, i) => {
      if (entry && colMap[i]) {
        const fields = tcxTypeFields[colMap[i]];
        for (const field of fields) {
          if (!contact[field]) {
            contact[field] = entry;
            break;
          }
        }
      }
    });
    return contact;
  });

  let csvRows: string[] = [];
  csvRows.push([...tcxHeaders].join(','));
  contacts.forEach(c => {
    const cols = tcxHeaders.map(col => c[col]);
    csvRows.push(cols.join(','));
  });
  return csvRows.join('\r\n');
}

export function CsvContactsConverter() {
  const { t } = useTranslation();
  // const { cols, setCols } = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const { control, register, handleSubmit } = useForm();
  const { fields, replace } = useFieldArray({
    control,
    name: "colmap", // unique name for your Field Array
  });

  const onCsv = useCallback((csv: string) => {
    csv = csv.replaceAll('\r\n', '\n').trim();
    const trows = csv.split('\n');
    const tcols = trows[0].split(',');
    replace(tcols.map(col => ({ col, tcxType: '' })));
    // slice removes header (col definitions)
    const rows = trows.slice(1).map(tr => tr.split(','));
    setRows(rows);
  }, [replace]);

  const onSubmit = useCallback(data => {
    const colMap = (data.colmap as Array<{ col: string, tcxType: TcxType }>).map(v => v.tcxType);
    const csv = generate3cxCsv(colMap, rows);

    const csvContent = "data:text/csv;charset=utf-8," + csv;
    const uri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = uri;
    link.download = 'contacts-3cx.csv';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 5000);
  }, [rows]);

  return (
    <div>
      <CsvUpload onCsv={onCsv} />
      <hr className="my-4" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="flex mb-2">
            <input
              type='text'
              key={field.id}
              disabled
              className="block border-none text-sm text-right"
              {...register(`colmap.${index}.col`)}
            />
            <select {...register(`colmap.${index}.tcxType`)}
              className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">{t('Ignore')}</option>
              <option disabled value="-------">-------</option>
              {tcxTypes.map(type =>
                <option key={type} value={type}>{type}</option>
              )}
            </select>
          </div>
        ))}
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          {t('Generate')} (.csv)
        </button>
      </form>
    </div>
  );
}
