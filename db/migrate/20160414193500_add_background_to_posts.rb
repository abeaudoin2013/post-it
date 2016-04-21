class AddBackgroundToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :background, :string
  end
end
