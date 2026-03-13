import Step4, { Step4Errors, Step4State } from './Step4';
import { formatTurkishPlateInput } from '@/lib/plate';

type Props = {
  value: Step4State;
  errors: Step4Errors;
  onChange: (field: keyof Step4State, value: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const extraFields = [
  { key: 'askPrice', label: 'İstenen Satış Fiyatı (TL)', type: 'number', placeholder: 'Örn: 1.250.000' },
  { key: 'minPrice', label: 'Minimum Kabul Edilebilir Fiyat (TL)', type: 'number', placeholder: 'Örn: 1.150.000' },
  { key: 'consignPeriod', label: 'Konsinye Bırakma Süresi (gün)', type: 'number', placeholder: 'Örn: 30' },
  { key: 'plate', label: 'Plaka Bilgisi', type: 'text', placeholder: 'Örn: 34 ABC 123' }
];

export default function Step4Consign(props: Props) {
  return (
    <div className="space-y-6">
      <Step4 {...props} />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Konsinye Tercihleri</h3>
        <p className="mt-1 text-sm text-slate-600">Hedef fiyatınızı, kabul edeceğiniz minimum fiyatı ve plaka bilgilerini ekleyin.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {extraFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">{field.label}</label>
              <input
                type={field.type}
                value={props.value[field.key as keyof Step4State] as string}
                onChange={(e) =>
                  props.onChange(
                    field.key as keyof Step4State,
                    field.key === 'plate' ? formatTurkishPlateInput(e.target.value) : e.target.value
                  )
                }
                placeholder={field.placeholder}
                maxLength={field.key === 'plate' ? 11 : undefined}
                autoCapitalize={field.key === 'plate' ? 'characters' : undefined}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {props.errors[field.key as keyof Step4Errors] ? (
                <p className="text-xs font-medium text-red-600">{props.errors[field.key as keyof Step4Errors]}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

