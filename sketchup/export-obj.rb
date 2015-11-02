# load(File.expand_path("~/Dev/baaahs/geometry/sketchup/export-obj.rb"))

if Object.constants.include?(:BAAAHS)
  puts "Unloading old BAAAHS::*"
  Object.__send__(:remove_const, :BAAAHS)
end

module BAAAHS
  module Geometry
    class Panel
      NAME_RE = /^((?<front>F|R)(?<side2>[DP]?))?(?<number>\d+)(?<side>[DP]?)$/

      def initialize(name, entity, faces)
        @name = name

        match = NAME_RE.match(entity.name)
        if match
          # todo: fill in other info from name…
        end

        @entity = entity
        @faces = faces
      end

      attr_reader :name, :entity, :faces
    end

    class Face
      def initialize(vertex_ids)
        @vertex_ids = vertex_ids
      end

      attr_reader :vertex_ids
    end

    class Exporter
      def initialize
        @v_map = {}
        @vertices = []
        @panels = []
      end

      def traverse(e, parents = [], &cb)
        case e.typename
          when 'Model'
            cb.call(e, parents)
            e.entities.each { |e1| traverse(e1, parents, &cb) }
          when 'Group'
            cb.call(e, parents)
            e.entities.each { |e1| traverse(e1, parents + [e], &cb) }
          when 'ComponentInstance'
            cb.call(e, parents)
            e.definition.entities.each { |e1| traverse(e1, parents + [e], &cb) }
          else
            cb.call(e, parents)
        end
      end

      def is_panel?(e)
        e.respond_to?(:name) && e.name =~ /^(F|R[DP]?)?\d+[AB]?[DP]?$/ #&& e.typename == 'Group'
      end

      def is_other_external_part?(e)
        e.respond_to?(:name) && e.name =~ /^(Face|Tail|(Ear|Eye) [DP])$/ #&& e.typename == 'Group'
      end

# traverse model do |e|
#   if e.entities.size == 1 && e.entities[0].typename == 'ComponentInstance'
#     puts "#{e.name}: #{e.typename}"
#     e.entities[0].explode()
#   end
# end

      def whut(t)
        # t.identity? ? "none" : "origin: #{t.origin.inspect} rotation: #{t.to_a.inspect}"
        t.identity? ? "identity" : t.to_a
      end

      def pt3fmt(pt3)
        "(#{huh pt3.x}, #{huh pt3.y}, #{huh pt3.z})"
      end

      def huh(inches)
        ft = (inches / 12).to_i
        inches = inches % 12
        "#{ft}'#{inches.round}\""
      end

      def vertex_id_for(pt3)
        pt3_key = pt3.to_a.map { |x| (x * 1000000).to_i }.join(",")
        unless @v_map.include?(pt3_key)
          # p pt3_key
          @v_map[pt3_key] = @vertices.size
          @vertices.push(pt3)
        end
        @v_map[pt3_key]
      end

      def found_panel(e, f, parents)
        @log.puts "\nPart #{e.name}"
        # return unless e.name =~ /^F/
        # return unless e.name == '7P' || e.name == '7D' || e.name == '17P' || e.name == '17D' || e.name == '97D' || e.name == '90D'
        panel_entity = e

        faces = []
        traverse(panel_entity, parents) do |e2, face_parents|
          if e2.typename == 'Face'
            face = e2

            xforms = face_parents.map { |p| p.transformation }
            # xforms.shift
            @log.puts "  parents: #{face_parents.map { |p| "#{p.name} (#{p.typename} — offset=#{pt3fmt(p.transformation.origin)})" }.join(" ")}"
            # @log.puts "  xforms: #{xforms.inspect}"

            points = face.mesh.points
            face.mesh.polygons.each do |point_indexes|
              vertices = point_indexes.map { |i| points[i.abs - 1] }
              @log.puts vertices.inspect
              vertex_ids = vertices.map do |pt3|
                xforms.reverse.each_with_index do |t, i|
                  pt_before = pt3
                  pt3 = pt3.transform(t) unless t.identity?
                  # @log.puts pt3.inspect
                  # @log.puts t.origin.inspect
                  # vector = Geom::Vector3d.new([t.origin.x, t.origin.y, t.origin.z])
                  # @log.puts (pt3 + vector).inspect
                  # pt3 = pt3 + vector unless t.identity?
                  @log.puts "#{i == 0 ? '*' : ' '}    #{pt3fmt pt_before} + #{pt3fmt t.origin} ->  #{pt3fmt pt3}"
                end
                # @log.puts "  Vertex #{v} of #{part_name}: #{pt3fmt pt3}"
                # pt3 = pt3.to_a

                vertex_id_for(pt3)
              end

              faces << Face.new(vertex_ids)
              @log.puts "#{vertex_ids.inspect}: [#{vertex_ids.map { |v_index| v = @vertices[v_index]; pt3fmt(v) }.join(', ')}]"
            end
          end
        end

        unless faces.empty?
          @panels << Panel.new(e.name, panel_entity, faces)
        end
      end

      def export
        model = Sketchup.active_model
        dest_path = File.expand_path("~/Dev/baaahs/geometry/export-from-model.obj")
        puts "Exporting #{model.path} to #{dest_path}"

        File.open(File.expand_path("~/Dev/baaahs/geometry/log.txt"), "w") do |log|
          @log = log
          log << "Exporting #{model.path} to #{dest_path}…\n"

          begin
            File.open(dest_path, "w") do |f|
              traverse model do |e, parents|
                if is_panel?(e) || is_other_external_part?(e)
                  found_panel(e, f, parents)
                end
              end

              f << "# OBJ model file\n"
              f << "# Exported from SketchUp with BAAAHS::Geometry\n"
              f << "# File units = inches\n"
              f << "\n"

              @vertices.each do |vertex|
                z, x, y = vertex.to_a
                f << "v %f %f %f\n" % [x, y, z]
              end

              @panels.each do |panel|
                f << "\n"
                f << "o #{panel.name}\n"
                panel.faces.each do |face|
                  f << "f #{face.vertex_ids.map { |id| id + 1 }.join(" ")}\n"
                end
              end

              # @log.puts "hi!"
              puts "Exported #{@panels.size} panels."
            end
          rescue => e
            log << e.message
            log << "\n"
            log << e.backtrace.join("\n")
            log << "\n"
            raise
          end
        end
      end

=begin
  model.entities.each do |e|
    if e.is_a?(Sketchup::ComponentInstance)
      @log.puts "Component #{e.definition.name}: transformation: #{whut e.transformation}"

      if e.definition.name == "Ray"
        @log.puts "Start: #{pt3fmt e.definition.entities[0].start.position.transform(e.transformation)}"
        @log.puts "End: #{pt3fmt e.definition.entities[0].end.position.transform(e.transformation)}"
      else
        e.definition.entities.each do |group|
          @log.puts "Group #{group.name}: transformation: #{whut group.transformation}"

          group.entities.each do |component_entity|
            if component_entity.is_a?(Sketchup::ComponentInstance)
              @log.puts "Part #{component_entity.name}: transformation: #{whut component_entity.transformation}"

              component_entity.definition.entities.each do |face|
                emit_one(f, face, group.name, [component_entity.transformation, group.transformation, e.transformation])
              end
            else
              # @log.puts "Part is a #{component_entity.class.name}"
              emit_one(f, component_entity, group.name, [group.transformation, e.transformation])
            end
          end
        end
      end
    end

    @log.puts e.name
  end
=end

    end
  end
end

BAAAHS::Geometry::Exporter.new.export
