class VictoryType {
  final int id;
  final String name;

  VictoryType({required this.id, required this.name});

  factory VictoryType.fromJson(Map<String, dynamic> json) {
    return VictoryType(id: json['id'] as int, name: json['name'] as String);
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name};
  }

  VictoryType copyWith({int? id, String? name}) {
    return VictoryType(id: id ?? this.id, name: name ?? this.name);
  }
}
