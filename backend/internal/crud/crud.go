// Package crud defines the generic repository contract shared by repositories.
package crud

import "gorm.io/gorm"

// Repository is the minimal CRUD contract for a domain entity identified by a
// uint primary key.
//
// T is the domain entity type; FO and LO are the repository-specific find and
// list options types, defined by each repository. The database handle is passed
// per call so the caller (typically a service) owns connection and transaction
// scope. Create and Update take pointers so an implementation can write back
// database-generated values (for example, an ID).
type Repository[T any, FO any, LO any] interface {
	// Create persists entity using db and fills in any generated fields.
	Create(db *gorm.DB, entity *T) error

	// Find returns the single entity matching opts using db.
	Find(db *gorm.DB, opts FO) (*T, error)

	// List returns all entities matching opts using db.
	List(db *gorm.DB, opts LO) ([]T, error)

	// Update persists changes to entity using db.
	Update(db *gorm.DB, entity *T) error

	// Delete removes the entity with the given ID using db.
	// The bool reports whether a row was actually removed.
	Delete(db *gorm.DB, id uint) (bool, error)
}
