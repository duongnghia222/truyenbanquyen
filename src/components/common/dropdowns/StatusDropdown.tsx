'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export interface StatusOption {
  id: string
  label: string
  color: string
  textColor: string
}

interface StatusDropdownProps {
  status: string
  options: StatusOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export function StatusDropdown({
  status,
  options,
  onChange,
  disabled = false
}: StatusDropdownProps) {
  const currentOption = options.find(option => option.id === status) || options[0]

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          disabled={disabled}
          className={`inline-flex w-full justify-center items-center rounded-md px-3 py-1.5 text-sm font-medium ${
            currentOption.color
          } ${currentOption.textColor} focus:outline-none ${
            !disabled ? 'hover:brightness-95' : 'opacity-70 cursor-not-allowed'
          }`}
        >
          {currentOption.label}
          {!disabled && (
            <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.id}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.id)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } ${
                      status === option.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                    } group flex w-full items-center px-3 py-2 text-sm`}
                  >
                    <span className={`mr-2 h-2 w-2 rounded-full ${option.color}`}></span>
                    <span className="text-gray-900 dark:text-white">{option.label}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 