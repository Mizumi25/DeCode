export const getTailwindEquivalent = (cssProperty, value) => {
  if (!value || value === 'default' || value === 'auto') return [];

  const mappings = {
    // Spacing
    padding: (val) => [`p-[${val}]`],
    paddingTop: (val) => [`pt-[${val}]`],
    paddingRight: (val) => [`pr-[${val}]`],
    paddingBottom: (val) => [`pb-[${val}]`],
    paddingLeft: (val) => [`pl-[${val}]`],
    margin: (val) => [`m-[${val}]`],
    marginTop: (val) => [`mt-[${val}]`],
    marginRight: (val) => [`mr-[${val}]`],
    marginBottom: (val) => [`mb-[${val}]`],
    marginLeft: (val) => [`ml-[${val}]`],
    
    // Sizing
    width: (val) => [`w-[${val}]`],
    height: (val) => [`h-[${val}]`],
    minWidth: (val) => [`min-w-[${val}]`],
    maxWidth: (val) => [`max-w-[${val}]`],
    minHeight: (val) => [`min-h-[${val}]`],
    maxHeight: (val) => [`max-h-[${val}]`],
    
    // Display & Layout
    display: (val) => {
      const map = {
        'block': ['block'],
        'inline-block': ['inline-block'],
        'flex': ['flex'],
        'inline-flex': ['inline-flex'],
        'grid': ['grid'],
        'none': ['hidden']
      };
      return map[val] || [`display-[${val}]`];
    },
    
    flexDirection: (val) => {
      const map = {
        'row': ['flex-row'],
        'column': ['flex-col'],
        'row-reverse': ['flex-row-reverse'],
        'column-reverse': ['flex-col-reverse']
      };
      return map[val] || [];
    },
    
    justifyContent: (val) => {
      const map = {
        'flex-start': ['justify-start'],
        'center': ['justify-center'],
        'flex-end': ['justify-end'],
        'space-between': ['justify-between'],
        'space-around': ['justify-around']
      };
      return map[val] || [];
    },
    
    alignItems: (val) => {
      const map = {
        'flex-start': ['items-start'],
        'center': ['items-center'],
        'flex-end': ['items-end'],
        'stretch': ['items-stretch'],
        'baseline': ['items-baseline']
      };
      return map[val] || [];
    },
    
    gap: (val) => [`gap-[${val}]`],
    
    // Colors
    backgroundColor: (val) => [`bg-[${val}]`],
    color: (val) => [`text-[${val}]`],
    borderColor: (val) => [`border-[${val}]`],
    
    // Typography
    fontSize: (val) => [`text-[${val}]`],
    fontWeight: (val) => {
      const map = {
        '100': ['font-thin'],
        '200': ['font-extralight'],
        '300': ['font-light'],
        '400': ['font-normal'],
        '500': ['font-medium'],
        '600': ['font-semibold'],
        '700': ['font-bold'],
        '800': ['font-extrabold'],
        '900': ['font-black']
      };
      return map[val] || [`font-[${val}]`];
    },
    
    textAlign: (val) => {
      const map = {
        'left': ['text-left'],
        'center': ['text-center'],
        'right': ['text-right'],
        'justify': ['text-justify']
      };
      return map[val] || [];
    },
    
    // Borders
    borderWidth: (val) => [`border-[${val}]`],
    borderRadius: (val) => [`rounded-[${val}]`],
    
    // Position
    position: (val) => {
      const map = {
        'static': ['static'],
        'relative': ['relative'],
        'absolute': ['absolute'],
        'fixed': ['fixed'],
        'sticky': ['sticky']
      };
      return map[val] || [];
    }
  };

  const mapper = mappings[cssProperty];
  return mapper ? mapper(value) : [];
};