# bookshelf-upsert
A plugin that includes an upsert method to Bookshelf Model &amp; Collection. (Postgresql only)

## Install

```javascript
bookshelf.plugin( require( './bookshelf-upsert' ) );
```

## Usage

```javascript
bookshelf.transaction(async(trx) => {

        // Initialize Tag Insert Params
        let params = [{
            created_by: 'john doe',
            updated_by: 'john doe',
            name: 'pink'
        }, {
            created_by: 'john doe',
            updated_by: 'john doe',
            name: 'yellow'
        }, {
            created_by: 'john doe',
            updated_by: 'john doe',
            name: 'blue'
        }]

        const tag_ids = await Tag
            .forge()
            .upsert({
                tableName: 'tag',
                conflictTarget: ['name'],
                updateTarget: ['updated_by'],
                itemData: params,
                transaction: trx
            })

        .then(trx.commit)
        .catch(trx.rollback)
        
})
.then(results => console.log(results))
.catch(reason => console.log(reason))
```
