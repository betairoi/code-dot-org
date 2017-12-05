class CreateFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :featured_projects do |t|
      t.integer :storage_app_id
      t.integer :who_featured_user_id
      t.integer :whose_project_user_id

      t.timestamps
    end
    add_index :featured_projects, :storage_app_id
  end
end
