class User {
  final String id;
  final String email;
  final String nombrePreferido;
  final String token;

  User({
    required this.id,
    required this.email,
    required this.nombrePreferido,
    required this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      nombrePreferido: json['nombrePreferido'] as String,
      token: json['token'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nombrePreferido': nombrePreferido,
      'token': token,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? nombrePreferido,
    String? token,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      nombrePreferido: nombrePreferido ?? this.nombrePreferido,
      token: token ?? this.token,
    );
  }
}
