import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormValues } from '@/hooks/useIncidentForm';
import { X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

type SearchSelectProps = {
  form: UseFormReturn<FormValues>;
  name: string;
  label: string;
  placeholder: string;
  options: { id: string; name: string }[];
  searchValue: string;
  setSearchValue: (value: string) => void;
  disabled?: boolean;
};

function SearchSelect({
  form,
  name,
  label,
  placeholder,
  options,
  searchValue,
  setSearchValue,
  disabled,
}: SearchSelectProps) {
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              {disabled && <p>Please select a state before you can select a school/district</p>}
              <Input
                disabled={disabled}
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="mb-2"
              />
              {searchValue && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (!field.value?.includes(option.name)) {
                            field.onChange(field.value ? [...field.value, option.name] : [option.name]);
                          }
                          setSearchValue('');
                        }}
                      >
                        {option.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>

            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {field.value.map((val: string) => (
                  <div key={val} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                    <span>{val}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        field.onChange(field.value?.filter((s: string) => s !== val));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SearchSelect;
