import { Control, Controller, FieldError } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  control: Control<any>;
  startName: string;
  endName: string;
  label: string;
}

interface DatePickerFieldProps {
  onChange: (date: Date | null) => void;
  value: Date | null;
  error?: FieldError;
}

export const DateRangePicker = ({
  control,
  startName,
  endName,
  label
}: DateRangePickerProps) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-4">
        <div className="flex-1">
          <Controller
            control={control}
            name={startName}
            render={({ field: { onChange, value }, fieldState: { error } }: { field: DatePickerFieldProps; fieldState: { error?: FieldError } }) => (
              <div>
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  selectsStart
                  startDate={value}
                  endDate={control._getWatch(endName)}
                  minDate={new Date()}
                  placeholderText="Start Date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>
        <div className="flex-1">
          <Controller
            control={control}
            name={endName}
            render={({ field: { onChange, value }, fieldState: { error } }: { field: DatePickerFieldProps; fieldState: { error?: FieldError } }) => (
              <div>
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  selectsEnd
                  startDate={control._getWatch(startName)}
                  endDate={value}
                  minDate={control._getWatch(startName) || new Date()}
                  placeholderText="End Date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}; 