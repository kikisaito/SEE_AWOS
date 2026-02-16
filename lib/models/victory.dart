class Victory {
  final String id;
  final String name;
  final DateTime occurredAt;

  Victory({required this.id, required this.name, required this.occurredAt});

  factory Victory.fromJson(Map<String, dynamic> json) {
    return Victory(
      id: json['id'] as String,
      name: json['name'] as String,
      occurredAt: DateTime.parse(json['occurred_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'occurred_at': occurredAt.toIso8601String(),
    };
  }

  Victory copyWith({String? id, String? name, DateTime? occurredAt}) {
    return Victory(
      id: id ?? this.id,
      name: name ?? this.name,
      occurredAt: occurredAt ?? this.occurredAt,
    );
  }
}
